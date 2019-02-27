export const Check = (lamda: function, self: boolean) => {
    return function(target, key, descriptor) {
        const method = descriptor.value

        descriptor.value = function(...args) {
            if (lamda(...(self ? [this, ...args] : [...args]))) {
                try {
                    return method.apply(this, args)
                } catch (error) {
                    console.log(error)
                    return false
                }
            }
            
            return false
        }

        return descriptor
    }
}
