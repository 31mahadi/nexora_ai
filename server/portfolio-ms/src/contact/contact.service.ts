import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContactSubmissionEntity } from "./entities/contact-submission.entity";

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmissionEntity)
    private readonly repo: Repository<ContactSubmissionEntity>,
  ) {}

  async submit(
    tenantId: string,
    data: { name: string; email: string; message: string },
  ): Promise<{ success: boolean }> {
    const row = this.repo.create({
      tenantId,
      name: data.name.trim().slice(0, 255),
      email: data.email.trim().slice(0, 255),
      message: data.message.trim(),
    });
    await this.repo.save(row);
    return { success: true };
  }

  async findAll(tenantId: string) {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async delete(tenantId: string, id: string) {
    const result = await this.repo.delete({ id, tenantId });
    return { deleted: result.affected ? result.affected > 0 : false };
  }
}
