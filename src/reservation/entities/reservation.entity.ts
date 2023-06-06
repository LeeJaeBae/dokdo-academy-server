import { Company } from 'src/lib/entities/company.entity';
import { CoreEntity } from 'src/lib/entities/core.entity';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Payment } from './payments.entity';
import { Tour } from 'src/tour/entities/tour.entity';

@Entity()
export class Reservation extends CoreEntity {
  @ManyToOne(() => Company, (company) => company.reservations, {
    eager: true,
  })
  company: Company;

  @OneToOne(() => Payment, {
    nullable: true,
  })
  payment: Payment;

  @ManyToOne(() => Tour, (tour) => tour.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tourId', referencedColumnName: 'id' })
  tour: Tour;

  @Column()
  tourId: number;

  @Column({ default: 0 })
  price: number;

  @Column()
  detail: string;

  @AfterLoad()
  setDetail(): void {
    if (this.detail) {
      this.detail = JSON.parse(this.detail as string);
    }
  }

  @Column()
  type: string;

  @Column({ nullable: true })
  receipt?: string;
}
