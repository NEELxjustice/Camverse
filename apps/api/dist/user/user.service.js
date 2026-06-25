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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSavedCameras(userId) {
        return this.prisma.client.savedCamera.findMany({
            where: { userId },
            include: {
                camera: {
                    include: {
                        specifications: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async toggleSaveCamera(userId, cameraId) {
        const camera = await this.prisma.client.camera.findUnique({
            where: { id: cameraId },
        });
        if (!camera) {
            throw new common_1.NotFoundException(`Camera not found`);
        }
        const existing = await this.prisma.client.savedCamera.findUnique({
            where: {
                userId_cameraId: {
                    userId,
                    cameraId,
                },
            },
        });
        if (existing) {
            await this.prisma.client.savedCamera.delete({
                where: {
                    userId_cameraId: {
                        userId,
                        cameraId,
                    },
                },
            });
            return { saved: false };
        }
        else {
            await this.prisma.client.savedCamera.create({
                data: {
                    userId,
                    cameraId,
                },
            });
            return { saved: true };
        }
    }
    async getOrCreateUser(email, name, clerkId) {
        const existing = await this.prisma.client.user.findFirst({
            where: {
                OR: [
                    { email },
                    clerkId ? { clerkId } : {},
                ],
            },
        });
        if (existing) {
            if ((name && !existing.name) || (clerkId && !existing.clerkId)) {
                return this.prisma.client.user.update({
                    where: { id: existing.id },
                    data: {
                        name: name || existing.name,
                        clerkId: clerkId || existing.clerkId,
                    },
                });
            }
            return existing;
        }
        return this.prisma.client.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                clerkId,
                role: email.startsWith('admin') ? 'ADMIN' : 'USER',
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map