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

    @Column({default: 0})
    gender: number

    @Column({default: 0})
    role: number

    @Column({default: false})
    block: boolean

    @Column({default: false})
    autoLink: boolean

    @ManyToOne(type => College)
    @JoinColumn()
    college: College

}