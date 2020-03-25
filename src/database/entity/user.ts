import {Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne} from "typeorm"
import {College} from "./college"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    peerId: number

    @Column()
    group: string

    @Column()
    gender: number

    @Column()
    role: number

    @Column()
    block: boolean

    @ManyToOne(type => College)
    @JoinColumn()
    college: College

}