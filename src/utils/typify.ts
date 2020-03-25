const tp = (json: any, toJson: any): object => {
    let data: any = {}
    Object.keys(json).map(function (key, index) {
        Object.keys(toJson).map(function (toKey) {
            if (index == toJson[toKey]) {
                console.log(toJson[toKey])
                data[toKey] = json[key]
            }
        })
    })
    return data
}

export const typify = (json: any, toJson: any): Array<object> => {
    let array = []

    if(json){
        if(Array.isArray(json)) {
            for(let obj of json){
                array.push(tp(obj, toJson))
            }
        } else {
            array.push(tp(json, toJson))
        }
    }

    return array
}

