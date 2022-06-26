import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArtileDto } from './dto/create-article.dto';
import { ArticleResponseInterface } from './types/article-response.interface';
import { ArticlesResponseInterface } from './types/articles-response.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const articlesQuery = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      articlesQuery.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOneBy({
        username: query.author,
      });
      articlesQuery.andWhere('articles.authorId = :id', { id: author.id });
    }

    articlesQuery.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await articlesQuery.getCount();

    if (query.limit) {
      articlesQuery.limit(query.limit);
    }

    if (query.offset) {
      articlesQuery.offset(query.offset);
    }

    const articles = await articlesQuery.getMany();
    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArtileDto,
  ): Promise<ArticleEntity> {
    const newArticle = new ArticleEntity();
    Object.assign(newArticle, createArticleDto);
    if (!createArticleDto.tagList) {
      newArticle.tagList = [];
    }

    newArticle.slug = this.getSlug(createArticleDto.title);

    newArticle.author = currentUser;

    return this.articleRepository.save(newArticle);
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    return this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: CreateArtileDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoriesCount++;
      this.articleRepository.save(article);
      this.userRepository.save(user);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });

    const articleIndex = user.favorites.findIndex(
      (articlesInFavorite) => articlesInFavorite.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoriesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneBy({ slug });

    if (!article) {
      throw new HttpException('article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  private getSlug(title: string): string {
    const randomStr = ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

    return slugify(title, { lower: true }) + '-' + randomStr;
  }
}
