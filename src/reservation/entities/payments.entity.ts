import { CoreEntity } from 'src/lib/entities/core.entity';
import { Tour } from 'src/tour/entities/tour.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class Payment extends CoreEntity {
  @ManyToOne(() => Tour, (tour) => tour.participants)
  tour: Tour;

  @Column()
  image: string;

  @Column()
  amount: number;

  @OneToOne(() => User)
  user: User;
}
