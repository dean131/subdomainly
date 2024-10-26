const login = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        return next(error);
    }
};
