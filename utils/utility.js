const RandomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

export { RandomRange };