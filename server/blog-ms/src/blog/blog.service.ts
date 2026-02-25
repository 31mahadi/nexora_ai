import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlogCommentEntity } from "./entities/blog-comment.entity";
import { BlogEntity } from "./entities/blog.entity";

export interface BlogPost {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogs: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private readonly comments: Repository<BlogCommentEntity>,
  ) {}

  private mapRow(r: BlogEntity): BlogPost {
    return {
      id: r.id,
      tenantId: r.tenantId,
      title: r.title,
      slug: r.slug,
      content: r.content,
      excerpt: r.excerpt,
      coverImage: r.coverImage,
      published: r.published,
      publishedAt: r.publishedAt?.toISOString?.() ?? null,
      createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: r.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  async create(
    tenantId: string,
    data: { title: string; slug?: string; content: string; excerpt?: string },
  ): Promise<BlogPost> {
    const fromTitle = data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/^-+|-+$/g, "");
    const baseSlug = (data.slug ?? fromTitle) || "post";
    let slug = baseSlug;
    let suffix = 1;
    while (await this.blogs.findOne({ where: { tenantId, slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    const created = await this.blogs.save(
      this.blogs.create({
        tenantId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt ?? null,
      }),
    );
    return this.mapRow(created);
  }

  async findAll(tenantId: string, publishedOnly?: boolean): Promise<BlogPost[]> {
    const rows = await this.blogs.find({
      where: publishedOnly ? { tenantId, published: true } : { tenantId },
      order: publishedOnly
        ? { publishedAt: { direction: "DESC", nulls: "LAST" } }
        : { createdAt: "DESC" },
    });
    return rows.map((row) => this.mapRow(row));
  }

  async findBySlug(tenantId: string, slug: string): Promise<BlogPost | null> {
    const row = await this.blogs.findOne({ where: { tenantId, slug } });
    return row ? this.mapRow(row) : null;
  }

  async findById(tenantId: string, id: string): Promise<BlogPost | null> {
    const row = await this.blogs.findOne({ where: { tenantId, id } });
    return row ? this.mapRow(row) : null;
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      published: boolean;
    }>,
  ): Promise<BlogPost> {
    const existing = await this.findById(tenantId, id);
    if (!existing) throw new NotFoundException("Blog not found");

    const row = await this.blogs.findOne({ where: { tenantId, id } });
    if (!row) throw new NotFoundException("Blog not found");
    if (data.title !== undefined) row.title = data.title;
    if (data.slug !== undefined) row.slug = data.slug;
    if (data.content !== undefined) row.content = data.content;
    if (data.excerpt !== undefined) row.excerpt = data.excerpt;
    if (data.published !== undefined) {
      row.published = data.published;
      if (data.published && !row.publishedAt) row.publishedAt = new Date();
    }
    await this.blogs.save(row);
    return (await this.findById(tenantId, id))!;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const res = await this.blogs.delete({ tenantId, id });
    if (!res.affected) throw new NotFoundException("Blog not found");
  }

  async addComment(
    blogId: string,
    tenantId: string,
    data: { content: string; guestEmail?: string },
  ) {
    await this.comments.save(
      this.comments.create({
        blogId,
        tenantId,
        content: data.content,
        guestEmail: data.guestEmail ?? null,
      }),
    );
  }
}
