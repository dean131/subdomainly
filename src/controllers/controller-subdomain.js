const index = async (req, res, next) => {
    try {
        res.render("index", {
            layout: "layouts/base",
            title: "Subdomain Search",
        });
    } catch (error) {
        return next(error);
    }
};

export default {
    index,
};
