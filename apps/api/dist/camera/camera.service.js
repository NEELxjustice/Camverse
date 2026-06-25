"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const utils_1 = require("@camverse/utils");
let CameraService = class CameraService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters.brand) {
            where.brand = { equals: filters.brand, mode: 'insensitive' };
        }
        if (filters.category) {
            where.category = { equals: filters.category, mode: 'insensitive' };
        }
        if (filters.sensorType) {
            where.sensorType = { equals: filters.sensorType, mode: 'insensitive' };
        }
        if (filters.search) {
            where.OR = [
                { brand: { contains: filters.search, mode: 'insensitive' } },
                { model: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.client.camera.findMany({
            where,
            include: {
                specifications: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findBySlug(slug) {
        const camera = await this.prisma.client.camera.findUnique({
            where: { slug },
            include: {
                specifications: true,
                features: true,
                hotspots: true,
                menu: true,
            },
        });
        if (!camera) {
            throw new common_1.NotFoundException(`Camera with slug ${slug} not found`);
        }
        return camera;
    }
    async getFeatures(cameraId) {
        return this.prisma.client.cameraFeature.findMany({
            where: { cameraId },
        });
    }
    async getHotspots(cameraId) {
        return this.prisma.client.cameraHotspot.findMany({
            where: { cameraId },
        });
    }
    async getSpecs(cameraId) {
        const specs = await this.prisma.client.cameraSpecification.findUnique({
            where: { cameraId },
        });
        if (!specs) {
            throw new common_1.NotFoundException(`Specifications for camera ${cameraId} not found`);
        }
        return specs;
    }
    async getMenu(cameraId) {
        const menu = await this.prisma.client.cameraMenu.findUnique({
            where: { cameraId },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu for camera ${cameraId} not found`);
        }
        return menu;
    }
    async create(data) {
        const slug = (0, utils_1.slugify)(`${data.brand}-${data.model}`);
        return this.prisma.client.$transaction(async (tx) => {
            const camera = await tx.camera.create({
                data: {
                    brand: data.brand,
                    model: data.model,
                    slug,
                    category: data.category,
                    sensorType: data.sensorType,
                    megapixels: data.megapixels,
                    mount: data.mount,
                    description: data.description,
                    thumbnail: data.thumbnail,
                    heroImage: data.heroImage,
                },
            });
            if (data.specifications) {
                await tx.cameraSpecification.create({
                    data: {
                        cameraId: camera.id,
                        ...data.specifications,
                    },
                });
            }
            if (data.features && data.features.length > 0) {
                await tx.cameraFeature.createMany({
                    data: data.features.map((f) => ({
                        cameraId: camera.id,
                        ...f,
                    })),
                });
            }
            if (data.hotspots && data.hotspots.length > 0) {
                await tx.cameraHotspot.createMany({
                    data: data.hotspots.map((h) => ({
                        cameraId: camera.id,
                        ...h,
                    })),
                });
            }
            if (data.menuStructure) {
                await tx.cameraMenu.create({
                    data: {
                        cameraId: camera.id,
                        structure: data.menuStructure,
                    },
                });
            }
            return tx.camera.findUnique({
                where: { id: camera.id },
                include: {
                    specifications: true,
                    features: true,
                    hotspots: true,
                    menu: true,
                },
            });
        });
    }
    async updateHotspots(cameraId, hotspots) {
        await this.prisma.client.cameraHotspot.deleteMany({
            where: { cameraId },
        });
        if (hotspots.length > 0) {
            await this.prisma.client.cameraHotspot.createMany({
                data: hotspots.map((h) => ({
                    cameraId,
                    buttonName: h.buttonName,
                    posX: parseFloat(h.posX),
                    posY: parseFloat(h.posY),
                    posZ: parseFloat(h.posZ),
                    description: h.description,
                    usage: h.usage,
                    scenario: h.scenario,
                })),
            });
        }
        return this.getHotspots(cameraId);
    }
    async updateMenu(cameraId, structure) {
        return this.prisma.client.cameraMenu.upsert({
            where: { cameraId },
            create: {
                cameraId,
                structure,
            },
            update: {
                structure,
            },
        });
    }
    async updateFeatures(cameraId, features) {
        await this.prisma.client.cameraFeature.deleteMany({
            where: { cameraId },
        });
        if (features.length > 0) {
            await this.prisma.client.cameraFeature.createMany({
                data: features.map((f) => ({
                    cameraId,
                    title: f.title,
                    description: f.description,
                    useCase: f.useCase,
                    benefit: f.benefit,
                    category: f.category,
                })),
            });
        }
        return this.getFeatures(cameraId);
    }
    async updateSpecs(cameraId, specs) {
        return this.prisma.client.cameraSpecification.upsert({
            where: { cameraId },
            create: {
                cameraId,
                ...specs,
            },
            update: {
                ...specs,
            },
        });
    }
};
exports.CameraService = CameraService;
exports.CameraService = CameraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CameraService);
//# sourceMappingURL=camera.service.js.map