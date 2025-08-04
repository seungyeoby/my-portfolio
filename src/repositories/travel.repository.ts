import prisma from "../lib/prisma.js";

export class TravelRepository {
  // 전체 여행정보 조회
  async findAll(category?: string) {
    let whereClause = {};
    if (category) {
      whereClause = { category: category };
    }
    
    return await prisma.travelTip.findMany({
      where: whereClause,
      orderBy: [
        { id: 'asc' }
      ]
    });
  }

  // ID로 여행정보 조회
  async findById(id: number) {
    return await prisma.travelTip.findUnique({
      where: { id: BigInt(id) },
    });
  }

  // 여행정보 생성
  async create(data: {
    title: string;
    content: string;
    category: string;
  }) {
    return await prisma.travelTip.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category,
      },
    });
  }

  // 여행정보 수정
  async update(id: number, data: {
    title?: string;
    content?: string;
    category?: string;
  }) {
    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.content !== undefined) {
      updateData.content = data.content.trim();
    }
    if (data.category !== undefined) {
      updateData.category = data.category;
    }

    return await prisma.travelTip.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  // 여행정보 삭제
  async delete(id: number) {
    return await prisma.travelTip.delete({
      where: { id: BigInt(id) },
    });
  }
} 