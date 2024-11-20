import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return this.walletRepository.save(createWalletDto);
  }

  findAll() {
    return `This action returns all wallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(filter: WalletFilter, updateWalletDto: UpdateWalletDto) {
    return this.walletRepository.update(filter, updateWalletDto);
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}