import { Role } from 'src/lib/decorators/roles.decorator';
import { CoreEntity } from 'src/lib/entities/core.entity';
import { Column, Entity } from 'typeorm';

import * as brcypt from 'bcrypt';

@Entity({
  orderBy: {
    name: 'ASC',
  },
})
export class User extends CoreEntity {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  roles: Role;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  phone: string;

  static async hashPassword(password: string) {
    try {
      return await brcypt.hash(password, 10);
    } catch {
      throw new Error('Could not hash password');
    }
  }

  async checkPassword(aPassword: string) {
    try {
      const ok = await brcypt.compare(aPassword, this.password);
      return ok;
    } catch {
      throw new Error('Could not compare password');
    }
  }
}
