export type TipoCatalogo = 'lenguajes' | 'tecnologias' | 'grupos' | 'tipos'

export interface ICatalogo {
  id:     number
  nombre: string
}

export interface IResponseCatalogos {
  lenguajes:   ICatalogo[]
  tecnologias: ICatalogo[]
  grupos:      ICatalogo[]
  tipos:       ICatalogo[]
}

export interface IArgsCreateCatalogo {
  tipo:   TipoCatalogo
  nombre: string
}

export interface IArgsUpdateCatalogo {
  tipo:   TipoCatalogo
  id:     number
  nombre: string
}

export interface IArgsDeleteCatalogo {
  tipo: TipoCatalogo
  id:   number
}
