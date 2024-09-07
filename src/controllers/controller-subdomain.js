const index = async (req, res, next) => {
    try {
        res.render("index", { title: "Subdomain Search" });
    } catch (error) {
        return next(error);
    }
};

export default {
    index,
};
