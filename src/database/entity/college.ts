import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne} from "typeorm"
import {City} from "./city"

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