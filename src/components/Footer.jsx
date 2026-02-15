import { Github, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3>BookMind</h3>
                    <p>Your premium destination for books.</p>
                </div>
                <div className="footer-section">
                    <h4>Links</h4>
                    <a href="/books">Browse</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </div>
                <div className="footer-section">
                    <h4>Social</h4>
                    <div className="social-links">
                        <a href="#"><Github size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 BookMind. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
