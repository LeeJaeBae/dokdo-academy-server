import { CoreEntity } from 'src/lib/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  orderBy: {
    target: 'ASC',
  },
})
export class Options extends CoreEntity {
  @Column()
  target: string;
  @Column({ unique: true })
  name: string;
  @Column({ type: 'int8' })
  value: number;
}

export class OptionsDto {
  target: string;
  name: string;
  value: number;

  constructor(name, target, value) {
    this.name = name;
    this.target = target;
    this.value = value;
  }
}

export const defaultOptions = [
  new OptionsDto('숙박(2인)', 'hotel', 70000),
  new OptionsDto('숙박(3인)', 'hotel', 85000),
  new OptionsDto('버스 이용료(3박)', 'bus', 85000),
  new OptionsDto('버스 이용료(2박)', 'bus', 75000),
  new OptionsDto('케이블카', 'attraction', 6500),
  new OptionsDto('모노레일', 'attraction', 3500),
  new OptionsDto('봉래폭포', 'attraction', 1500),
  new OptionsDto('관음도', 'attraction', 3500),
  new OptionsDto('예림원', 'attraction', 3000),
  new OptionsDto('울릉유람선', 'attraction', 20000),

  new OptionsDto('정식', 'restaurant', 10000),
  new OptionsDto('엉겅퀴', 'restaurant', 10000),
  new OptionsDto('오징어내장탕', 'restaurant', 12000),
  new OptionsDto('산채비빔밥', 'restaurant', 15000),
  new OptionsDto('홍합밥', 'restaurant', 18000),
  new OptionsDto('물회', 'restaurant', 19000),
  new OptionsDto('오삼불고기', 'restaurant', 19000),
  new OptionsDto('크루즈뷔페', 'restaurant', 20000),
  new OptionsDto('약소구이', 'restaurant', 32000),
];
