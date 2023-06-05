const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

exports.postLike = async (req,res,next)=>{
    const user = req.user;
    const {mid} = req.params;
    
    await prisma.$transaction(async(ctx)=>{
        let currentLike;
        try {
            currentLike = await ctx.movieLike.findFirst({where:{}})
        } catch (error) {
            
        }
        try {
            await ctx.movieLike.create({data:{liked:true,movie:{connect:{id:mid}}, user:{connect:user.id}}})
        } catch (error) {
            throw new HttpError("Something wrong happened",403);
        }
    })
}