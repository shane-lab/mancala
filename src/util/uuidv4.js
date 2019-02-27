const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = Math.random() * 16 | 0
    return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
})

export default uuidv4