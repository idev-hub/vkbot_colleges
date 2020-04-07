import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {City} from "./City"
import {IKeyboardProxyButton} from "vk-io";

export enum ETypeParse {
    jsonParse = 'json',
    bodyParse = 'body'
}

export interface IParamsCollege {
    type: ETypeParse,
    keyboards: Array<Array<IKeyboardProxyButton>>,
    api?:string,
    scheme?: object
}


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
    params: IParamsCollege

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

}