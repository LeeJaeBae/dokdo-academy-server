import { CoreEntity } from 'src/lib/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Tour } from './tour.entity';

@Entity()
export class Section extends CoreEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'academy' })
  collaborator: string;

  @OneToMany(() => Tour, (tour) => tour.section)
  tours: Tour[];
}
