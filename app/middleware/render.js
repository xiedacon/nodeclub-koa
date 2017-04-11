'use strict'

module.exports = (
    engine, 
    options= {}
) => {
    if(!engine) new Error(`Engine can't be null`);

    return (ctx, next) => {
        if(ctx.render) return next();

        ctx.render = (relPath, locals = {}) => {
            let state = Object.assign(locals, options, ctx.state || {});
            return engine(relPath, state)
                .then((html) => {
                    ctx.body = html;
                });
        }

        return next();
    };
}