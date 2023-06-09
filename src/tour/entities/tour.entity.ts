import { CoreEntity } from 'src/lib/entities/core.entity';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Section } from './section.entity';
import { Participant } from './participant.entity';
import { Group } from './group.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Payment } from 'src/reservation/entities/payments.entity';

@Entity({
  orderBy: {
    endDate: 'ASC',
    startDate: 'ASC',
  },
})
export class Tour extends CoreEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @ManyToOne(() => Section, (section) => section.tours, {
    onDelete: 'CASCADE',
  })
  section?: Section;

  @Column({ nullable: true })
  mainManager?: string;

  @OneToMany(() => Participant, (participant) => participant.tour)
  participants: Participant[];

  @Column({ default: 4 })
  groupCount: number;

  @OneToMany(() => Group, (group) => group.tour, {
    eager: true,
  })
  groups: Group[];

  @OneToMany(() => Reservation, (reservation) => reservation.tour, {
    eager: true,
  })
  reservations: Reservation[];

  @OneToMany(() => Payment, (payment) => payment.tour, {
    eager: true,
  })
  payments: Payment[];

  paymentAmount: number;

  usedAmount: number;

  reservedAmount: number;

  @AfterLoad()
  setPaymentAmount(): void {
    if (this.participants) {
      this.paymentAmount = this.participants.reduce(
        (acc, cur) => acc + cur.payment,
        0,
      );
    } else {
      this.paymentAmount = 0;
    }

    // if (this.payments) {
    //   this.usedAmount = this.payments.reduce((acc, cur) => acc + cur.amount, 0);
    // } else {
    //   this.usedAmount = 0;
    // }

    if (this.reservations) {
      this.reservedAmount = this.reservations.reduce(
        (acc, cur) => acc + cur.price,
        0,
      );
      this.usedAmount = this.reservations.reduce(
        (acc, cur) => acc + (cur.receipt !== null ? cur.price : 0),
        0,
      );
      console.log(this.usedAmount);
    } else {
      this.reservedAmount = 0;
      this.usedAmount = 0;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async groupCountCheck() {
    if (this.groups) {
      this.groupCount = this.groups.length;
    }
  }
}
