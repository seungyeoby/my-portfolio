import { TravelRepository } from "../../repositories/travel.repository.js";

export class TravelService {
  private travelRepository: TravelRepository;

  constructor() {
    this.travelRepository = new TravelRepository();
  }

  // 전체 여행정보 조회
  async getAllTravelInfo(category?: string) {
    const tips = await this.travelRepository.findAll(category);
    
    // BigInt를 Number로 변환하여 직렬화 가능하게 만들기
    return tips.map(tip => ({
      id: Number(tip.id),
      title: tip.title,
      content: tip.content,
      category: tip.category,
    }));
  }

  // 개별 여행정보 조회
  async getTravelInfoById(id: number) {
    const tip = await this.travelRepository.findById(id);
    
    if (!tip) {
      return null;
    }

    // BigInt를 Number로 변환하여 직렬화 가능하게 만들기
    return {
      id: Number(tip.id),
      title: tip.title,
      content: tip.content,
      category: tip.category,
    };
  }

  // 여행정보 생성
  async createTravelInfo(data: {
    title: string;
    content: string;
    category: string;
  }) {
    const newTip = await this.travelRepository.create(data);
    
    return {
      id: Number(newTip.id),
      title: newTip.title,
      content: newTip.content,
      category: newTip.category,
    };
  }

  // 여행정보 수정
  async updateTravelInfo(id: number, data: {
    title?: string;
    content?: string;
    category?: string;
  }) {
    // 수정할 데이터가 없는 경우
    if (Object.keys(data).length === 0) {
      throw new Error("수정할 데이터가 없습니다");
    }

    const updatedTip = await this.travelRepository.update(id, data);
    
    return {
      id: Number(updatedTip.id),
      title: updatedTip.title,
      content: updatedTip.content,
      category: updatedTip.category,
    };
  }

  // 여행정보 삭제
  async deleteTravelInfo(id: number) {
    await this.travelRepository.delete(id);
  }
} 