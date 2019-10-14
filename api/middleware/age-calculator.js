module.exports = (dateOfBirth => {
    try {
        var diff_ms = new Date().getTime() - dateOfBirth.getTime();
        var age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getFullYear() - 1970);
    } catch (error) {
        return { message: 'Not found' };
    }
})
