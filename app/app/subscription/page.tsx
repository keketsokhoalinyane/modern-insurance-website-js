"use client"

import { useState, useEffect } from "react"
import { Crown, Check, Zap, Heart, Eye, RotateCcw } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Add payment options state and functions
  const [paymentOptions, setPaymentOptions] = useState([])
  const [selectedPayment, setSelectedPayment] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  // Add useEffect to fetch payment options
  useEffect(() => {
    fetchPlans()
    fetchPaymentOptions()
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription/plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add fetchPaymentOptions function
  const fetchPaymentOptions = async () => {
    try {
      const response = await fetch("/api/payment/options")
      if (response.ok) {
        const data = await response.json()
        setPaymentOptions(data)
      }
    } catch (error) {
      console.error("Error fetching payment options:", error)
    }
  }

  // Update handleUpgrade function
  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  // Add processPayment function
  const processPayment = async () => {
    if (!selectedPayment) {
      alert("Please select a payment method")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: selectedPayment,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (selectedPayment === "bank_transfer") {
          // Show bank details
          alert(
            `Please transfer R${data.amount} to:\nBank: Tymbank\nAccount: 51057149240\nCard: 4847 9582 6022 7572\nReference: ${data.transactionId}`,
          )
        } else {
          // Redirect to payment gateway
          window.open(data.paymentUrl, "_blank")
        }

        setShowPaymentModal(false)
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Payment failed. Please try again.")
    }
  }

  // Add payment modal JSX before the return statement
  const PaymentModal = () =>
    showPaymentModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="card-dark p-6 rounded-2xl max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-4">Choose Payment Method</h3>
          <div className="space-y-3 mb-6">
            {paymentOptions.map((option: any) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:border-red-600 transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={selectedPayment === option.id}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="text-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-white font-medium">{option.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                  <p className="text-gray-500 text-xs">{option.processingTime}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 border border-gray-600 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={processPayment}
              className="flex-1 gradient-red py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <Heart className="h-6 w-6" />
      case "plus":
        return <Zap className="h-6 w-6" />
      case "pro":
        return <Crown className="h-6 w-6" />
      default:
        return <Heart className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "from-red-600 to-red-500"
      case "plus":
        return "from-purple-600 to-purple-500"
      case "pro":
        return "from-yellow-600 to-yellow-500"
      default:
        return "from-red-600 to-red-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Add PaymentModal component before the main return
  return (
    <div className="p-4">
      <PaymentModal />
      {/* Header */}
      <div className="text-center mb-8">
        <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Upgrade to Premium</h1>
        <p className="text-gray-400">Unlock unlimited messages and exclusive features</p>
      </div>

      {/* Current Status */}
      {user && (
        <div className="card-dark p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Current Plan</h3>
              <p className="text-gray-400 capitalize">{user.planType}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Messages Remaining</p>
              <p className="text-xl font-bold text-white">{user.isPremium ? "∞" : user.messageCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="space-y-4 mb-8">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`card-dark p-6 rounded-xl border-2 ${
              index === 1 ? "border-purple-600" : "border-transparent"
            } relative`}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)}`}>
                  {getPlanIcon(plan.id)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400">per month</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">R{plan.price}</span>
                <span className="text-gray-400">/{plan.currency}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              className={`w-full py-3 rounded-full font-semibold transition-opacity hover:opacity-90 ${
                index === 1
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                  : "bg-gradient-to-r " + getPlanColor(plan.id) + " text-white"
              }`}
            >
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Features Highlight */}
      <div className="card-dark p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Premium Benefits</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-gray-300">Unlimited Likes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-gray-300">See Who Likes You</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <RotateCcw className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-gray-300">Rewind Swipes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-gray-300">Profile Boosts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
