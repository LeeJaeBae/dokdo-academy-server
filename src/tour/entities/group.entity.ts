import { CoreEntity } from 'src/lib/entities/core.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Participant } from './participant.entity';
import { Tour } from './tour.entity';

@Entity({
  orderBy: {
    id: 'DESC',
  },
})
export class Group extends CoreEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  manager?: string;

  @ManyToOne(() => Tour, (tour) => tour.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tourId', referencedColumnName: 'id' })
  tour: Tour;

  @Column()
  tourId: number;

  @OneToMany(() => Participant, (participant) => participant.group)
  participants: Participant[];
}
