import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {City} from "./City"

/**
 * Модель колледжа
 * @beta
 **/
@Entity()
export class College {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    uri: string

    @Column('json')
    params: object

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

}