export type Message = {
    role: 'system' | 'user' | 'assistant'; // Define the possible roles
    content: string;
};
