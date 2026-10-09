import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ScansService } from "./scans.service";

@Controller("scans")
export class ScansController {
    constructor(private readonly scansService: ScansService) { }

    @Post()
    @UseInterceptors(FileInterceptor("zip"))
    async createScan(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException("zip file is required");

        if (!file.originalname.toLowerCase().endsWith(".zip")) {
            throw new BadRequestException("only zip files are supported");
        }

        const scanId = await this.scansService.enqueueZipScan(file);
        return { scanId };
    }

    @Get(":id")
    async getScan(@Param("id") id: string) {
        return this.scansService.getScan(id);
    }
}