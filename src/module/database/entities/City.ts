import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

/**
 * Модель города
 * @beta
 **/
@Entity()
export class City {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

}