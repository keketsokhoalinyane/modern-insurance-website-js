"use client"
import Link from "next/link"
import { Heart, MessageCircle, Users, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-white">TembiChat</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-red-400 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-red-400 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-red-400 transition-colors">
                Login
              </Link>
            </div>
            <Link
              href="/register"
              className="gradient-red px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Hook Up in</span>
            <br />
            <span className="text-red-600">Tembisa Now</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The hottest dating app for adults in Tembisa, South Africa. Find your perfect match and connect instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="gradient-red px-8 py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Start Hooking Up
            </Link>
            <Link
              href="/login"
              className="border-2 border-red-600 px-8 py-4 rounded-full text-red-400 font-bold text-lg hover:bg-red-600 hover:text-white transition-colors"
            >
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why Choose TembiChat?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-dark p-8 rounded-2xl text-center">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4 text-white">Smart Matching</h3>
              <p className="text-gray-300">
                Our algorithm finds your perfect match based on location, preferences, and compatibility.
              </p>
            </div>
            <div className="card-dark p-8 rounded-2xl text-center">
              <MessageCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4 text-white">Instant Chat</h3>
              <p className="text-gray-300">
                Connect immediately with your matches through our real-time messaging system.
              </p>
            </div>
            <div className="card-dark p-8 rounded-2xl text-center">
              <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4 text-white">Local Community</h3>
              <p className="text-gray-300">Meet real people in Tembisa who are looking for the same thing you are.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-red">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Find Your Match?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of singles in Tembisa who are already connecting on TembiChat.
          </p>
          <Link
            href="/register"
            className="bg-black px-8 py-4 rounded-full text-white font-bold text-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-900/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-lg font-bold text-white">TembiChat</span>
            </div>
            <div className="text-gray-400 text-sm">© 2024 TembiChat. Made with ❤️ for Tembisa.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
