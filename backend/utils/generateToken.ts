import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '40d',
    });
};

export default generateToken;
