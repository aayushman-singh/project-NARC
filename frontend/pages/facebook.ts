export default async function handler(req: any, res: any) {
    const { method } = req;

    if (method === 'POST') {
        try {
            // Send the request to your EC2 instance
            const response = await fetch('http://3.109.1.248:3002/facebook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });

            // Get the response from the EC2 instance
            const data = await response.json();
            
            // Pass the response back to the frontend
            res.status(response.status).json(data);
        } catch (error) {
            console.error('Error communicating with EC2 API:', error);
            res.status(500).json({ error: 'Failed to connect to Instagram API' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
