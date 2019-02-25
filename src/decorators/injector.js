const metadata = (target: any, type: string, key?: string) => Reflect && Reflect.getMetadata ? Reflect.getMetadata.getMetadata(`design:${type}`, target, key) : undefined

export const Inject = (typeFunction?: IInjectable, ...data: any[]) => {
    if (typeFunction && !(typeof typeFunction === 'function' && typeFunction.injectable)) {
        const type = typeof typeFunction
        throw new Error(`Decorated class member for type '${type === 'function' ? typeFunction.name : type}' is not injectable`)
    }

    return function (target: DecoratedTarget, propertyName: string, descriptor: PropertyDescriptor & { initializer?: any }) {
        typeFunction = typeFunction || Injector.getType(target, propertyName)

        if (!typeFunction) 
            throw new Error(`No type was specified for decorated class member '${propertyName}' in [${target.constructor.name}]`)

        let value = null;

        let provider = Injector.getProvider(typeFunction);
        if (provider && typeFunction.prototype !== Object.getPrototypeOf(provider)) {
            if (typeFunction.prototype !== Object.getPrototypeOf(provider)) {
                // remove undefined fields in base class
                Object.keys(provider).forEach(key => provider[key] === undefined && delete provider[key])

                provider = Object.assign(new typeFunction(...data), provider)

                if (!data) 
                    Injector.setProvider(typeFunction, provider)
            }

            value = target[propertyName] = provider
        }

        if (!value) {
            try {
                const injected = value = target[propertyName] = new typeFunction(...data)
    
                if ('predicate' in typeFunction && typeof typeFunction.predicate === 'function') 
                    typeFunction.predicate(injected)
    
                if (!data) 
                    Injector.setProvider(typeFunction, injected)
            } catch (err) {
                throw new Error(err.message || err)
            }
        }

        if (descriptor) {
            delete descriptor.initializer
            delete descriptor.writable
            
            descriptor.value = value
        }
    }
}

export const Injectable = (predicate?: (target) => void) => {
    return function (target: DecoratedTarget) {
        const provider = target

        provider.injectable = true;
        if (predicate && typeof predicate === 'function') 
            provider.predicate = predicate

        Injector.setProviderType(provider)
    }
}

class Injector {

    // store injectables
    static #providers: Map<Function | IInjectable<any>, any> = new Map()

    constructor() {
        throw new Error()
    }

    static setProviderType(typeFunction: IInjectable, ...data: any[]) {
        const provider = new typeFunction(...data)

        if ('predicate' in typeFunction && typeFunction['predicate']) 
            typeFunction.predicate(provider)

        Injector.setProvider(typeFunction, provider)
    }

    static setProvider(typeFunction: Function | IInjectable, provider) {
        Injector.#providers.set(typeFunction, provider)
    }

    static getProvider(typeFunction: Function | IInjectable) {
        // check if class is derrived and injectable but not registered
        if (typeFunction['injectable'] && !Injector.isProviderType(typeFunction)) 
            return Injector.getProvider(Object.getPrototypeOf(typeFunction))

        return Injector.#providers.get(typeFunction)
    }

    static isProviderType(typeFunction: Function | IInjectable<any>) {
        return Injector.#providers.get(typeFunction) !== undefined
    }

    static getParamTypes(target: DecoratedTarget): any[] {
        return metadata(target, 'paramtypes')
    }

    static getType(target: DecoratedTarget, key?: string) {
        return metadata(target, 'type', key)
    }
}