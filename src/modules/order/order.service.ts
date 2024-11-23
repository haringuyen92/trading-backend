import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDER_CREATED_EVENT, OrderCreatedEvent } from '../../events';
import { Wallet } from '../wallet/entities/wallet.entity';
import { MatchingEngineService } from './matching-engine.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly matchingEngineService: MatchingEngineService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { amount, price, user_id } = createOrderDto;
    const wallet = await this.walletRepository.findOneBy({
      user_id,
    });
    if (wallet.balance < amount * price) {
      throw new HttpException(
        'Insufficient balance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const result = await this.orderRepository.save({
      ...createOrderDto,
      status: OrderStatus.OPEN,
    });
    if (result) {
      this.eventEmitter.emit(
        ORDER_CREATED_EVENT,
        new OrderCreatedEvent(result.id),
      );
    }
    await this.matchingEngineService.processOrder(result);
    return result;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
