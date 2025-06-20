import { FilterQuery, Model, ProjectionType, QueryOptions, Types, UpdateQuery, PipelineStage } from "mongoose";

export abstract class DBService<T> {
    constructor(private readonly model: Model<T>) { }
    create(document: Partial<T>) {
        return this.model.create(document)
    }
    async find(
        filter?: FilterQuery<T>,
        select?: string,
        options?: QueryOptions<T>,
        page?: number
    ) {
        const query = this.model.find(filter || {}, {}, options)
        if (select) {
            query.select(select)
        }
        if (options?.sort) {
            query.sort(options.sort)
        }
        if (!page)
            return await query.exec()
        const limit = 10
        const skip: number = (page - 1) * limit
        const count = await this.model.countDocuments(filter)
        const pages = Math.ceil(count / limit)
        if (options) {
            options.skip = skip;
        }

        const documents: T[] = await query.exec()
        return {
            page,
            pages,
            documents
        }
    }
    findOne(
        filter: FilterQuery<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions
    ) {
        return this.model.findOne(filter, projection, options)
    }
    findById(
        id: string | Types.ObjectId,
        projection?: ProjectionType<T>,
        options?: QueryOptions
    ) {
        return this.model.findById(id, projection, options)
    }
    findByIdAndUpdate(
        id: string | Types.ObjectId,
        update: Partial<T>,
        options: QueryOptions
    ) {
        return this.model.findByIdAndUpdate(id, update, options)
    }
    findByIdAndDelete(
        id: string,
        options: QueryOptions
    ) {
        return this.model.findByIdAndDelete(id, options)
    }
    updateOne(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ) {
        return this.model.updateOne(filter, update)
    }

    // New methods
    countDocuments(filter?: FilterQuery<T>) {
        return this.model.countDocuments(filter || {})
    }

    aggregate(pipeline: PipelineStage[]) {
        return this.model.aggregate(pipeline)
    }

    async aggregateWithPagination(
        pipeline: PipelineStage[],
        page?: number,
        limit: number = 10
    ) {
        if (!page) {
            return await this.model.aggregate(pipeline)
        }

        const skip = (page - 1) * limit
        
        // Get total count
        const countPipeline = [
            ...pipeline,
            { $count: "total" }
        ]
        const countResult = await this.model.aggregate(countPipeline)
        const total = countResult[0]?.total || 0
        const pages = Math.ceil(total / limit)

        // Get paginated results
        const dataPipeline = [
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
        ]
        const documents = await this.model.aggregate(dataPipeline)

        return {
            page,
            pages,
            total,
            documents
        }
    }

    async findWithPopulate(
        filter?: FilterQuery<T>,
        populate?: any[],
        select?: string,
        options?: QueryOptions<T>,
        page?: number
    ) {
        let query = this.model.find(filter || {}, {}, options)
        
        if (select) {
            query.select(select)
        }
        
        if (populate && populate.length > 0) {
            populate.forEach(pop => {
                query = query.populate(pop)
            })
        }
        
        if (options?.sort) {
            query.sort(options.sort)
        }
        
        if (!page) {
            return await query.exec()
        }
        
        const limit = 10
        const skip: number = (page - 1) * limit
        const count = await this.model.countDocuments(filter)
        const pages = Math.ceil(count / limit)
        
        if (options) {
            options.skip = skip
        }
        
        const documents: T[] = await query.exec()
        return {
            page,
            pages,
            documents
        }
    }

    async findOneWithPopulate(
        filter: FilterQuery<T>,
        populate?: any[],
        projection?: ProjectionType<T>,
        options?: QueryOptions
    ) {
        let query = this.model.findOne(filter, projection, options)
        
        if (populate && populate.length > 0) {
            populate.forEach(pop => {
                query = query.populate(pop)
            })
        }
        
        return await query.exec()
    }

    async findByIdWithPopulate(
        id: string | Types.ObjectId,
        populate?: any[],
        projection?: ProjectionType<T>,
        options?: QueryOptions
    ) {
        let query = this.model.findById(id, projection, options)
        
        if (populate && populate.length > 0) {
            populate.forEach(pop => {
                query = query.populate(pop)
            })
        }
        
        return await query.exec()
    }
}