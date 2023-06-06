import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Entity()
export class Company {
  @PrimaryColumn({ unique: true, width: 10 })
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  owner?: string;

  @Column({ nullable: true })
  type?: string;

  @OneToMany(() => Reservation, (reservation) => reservation.company)
  reservations: Reservation[];

  @Column({ type: 'jsonb', nullable: true })
  detail?: object;
}
