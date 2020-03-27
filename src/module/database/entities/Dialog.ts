import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {User} from "./User";

/**
 * Модель диалога
 * @beta
 **/
@Entity()
export class Dialog {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(type => User)
    @JoinColumn()
    user: number

    @OneToOne(type => User)
    @JoinColumn()
    companion: number

    @Column({ default: null })
    search: string

    @Column({ default: null })
    smile: string

}