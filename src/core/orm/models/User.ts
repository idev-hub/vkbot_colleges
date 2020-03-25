import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {College} from "./College"

/**
 * Модель пользователя
 * @beta
 **/
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