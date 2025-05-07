const {AuthenticationError} = require ("apollo-server-express");

const  withRole = (resolver, allowedRoles) => {
    return async (parent, args, context , info) => {
        const {user} =context;
        if(!user ||!allowedRoles.includes(user.role)){
          throw new AuthenticationError("Unauthorizes");
                  }
        return resolver (parent, args, context, info);
    };
};

module.exports =withRole