import express from 'express';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Rota para servir o HTML de login
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'html', 'login.html'));
});

// Criar usuário
app.post('/usuarios', async (req, res) => {
    try {
        const { cpf, name, password } = req.body;
        
        const usuario = await prisma.user.create({
            data: { cpf, name, password }
        });
        
        res.status(201).json({ message: 'Usuário criado com sucesso', user: usuario });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ message: 'CPF já está em uso' });
        } else {
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { cpf, password } = req.body;
        
        const usuario = await prisma.user.findUnique({
            where: { cpf },
            include: { address: true }
        });
        
        if (!usuario) {
            return res.status(404).json({ message: 'CPF não encontrado' });
        }
        
        // Aqui você deveria verificar a senha hash, mas por simplicidade:
        if (usuario.password !== password) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }
        
        res.json({ message: 'Login realizado com sucesso', user: { id: usuario.id, name: usuario.name, cpf: usuario.cpf } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar todos os usuários
app.get('/usuarios', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                address: true,
                posts: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ 
            error: "Erro ao buscar usuários", 
            details: error.message 
        });
    }
});

// Rota para buscar usuário por CPF (para login)
app.post('/login', async (req, res) => {
    try {
        const { cpf } = req.body;
        const user = await prisma.user.findUnique({
            where: { cpf: cpf },
            include: {
                address: true
            }
        });
        
        if (user) {
            res.json({ 
                message: "Login realizado com sucesso", 
                user: user 
            });
        } else {
            res.status(404).json({ 
                error: "Usuário não encontrado" 
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            error: "Erro no login", 
            details: error.message 
        });
    }
});

// Rota para buscar usuário por ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                address: true,
                posts: true
            }
        });
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ 
            error: "Erro ao buscar usuário", 
            details: error.message 
        });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

