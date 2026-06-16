"use client";

import { useState } from "react";
import { Search, Send, CheckCircle, AlertCircle, LogOut, Users, FileText, Smartphone, BadgeCheck } from "lucide-react";
import { signOut } from "next-auth/react";

interface KoboSubmission {
  _id: number;
  phone_number?: string;
  full_name?: string;
  participant_id?: string;
  camp?: string;
  _submission_time: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<KoboSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [sendPhone, setSendPhone] = useState("");
  const [paymentReceived, setPaymentReceived] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");
  const [sendErrorMsg, setSendErrorMsg] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchError("");
    setResults([]);
    setSelectedId(null);
    setSendStatus("idle");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      
      const data = await res.json();
      setResults(data.results);
      
      if (data.results.length === 1) {
        setSelectedId(data.results[0]._id);
        const phone = data.results[0].phone_number || "";
        setSendPhone(phone);
      } else if (data.results.length === 0) {
        setSearchError("No participants found matching your query.");
      }
    } catch (err: any) {
      setSearchError(err.message || "An error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (sub: KoboSubmission) => {
    setSelectedId(sub._id);
    setSendPhone(sub.phone_number || "");
    setSendStatus("idle");
  };

  const handleSend = async () => {
    if (!selectedId || !sendPhone || !paymentReceived) return;

    setIsSending(true);
    setSendStatus("idle");
    setSendErrorMsg("");

    try {
      const res = await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedId,
          phone: sendPhone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send PDF");
      }

      setSendStatus("success");
    } catch (err: any) {
      setSendStatus("error");
      setSendErrorMsg(err.message || "Failed to send PDF");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans text-gray-800 pb-20">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img 
                src="https://satorufoundation.org/logo.png" 
                alt="Satoru Foundation Logo" 
                className="h-10 w-auto object-contain" 
              />
            </div>
            <div>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Header Area */}
      <div className="bg-[#5e6f47] pb-24 pt-10 border-t-4 border-[#ecc750]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">Participant Dashboard</h1>
          <p className="text-[#ecc750] text-sm md:text-base font-medium opacity-90">
            Search entries, verify details, and issue submission PDFs.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 space-y-6">
        
        {/* Search Section (Elevated Card) */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search by Phone Number, Name, or Participant ID..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#ecc750] focus:bg-white transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-[#5e6f47] text-white px-8 py-4 rounded-xl hover:bg-[#4a5738] disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Searching
                </span>
              ) : "Search"}
            </button>
          </form>
          {searchError && (
            <div className="mt-4 flex items-center gap-2 text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{searchError}</p>
            </div>
          )}
        </section>

        {/* Empty State / Welcome State */}
        {!hasSearched && results.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Search</h3>
            <p className="text-gray-500 max-w-md">
              Enter a phone number, name, or participant ID in the search bar above to pull up KoboToolbox submissions.
            </p>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FileText className="text-[#5e6f47]" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
              </div>
              <span className="bg-[#5e6f47]/10 text-[#5e6f47] text-xs font-bold px-3 py-1 rounded-full">
                {results.length} found
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Select</th>
                    <th className="px-6 py-4 font-medium">Participant Name</th>
                    <th className="px-6 py-4 font-medium">Contact Info</th>
                    <th className="px-6 py-4 font-medium">ID & Camp</th>
                    <th className="px-6 py-4 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((sub) => {
                    const isSelected = selectedId === sub._id;
                    return (
                      <tr 
                        key={sub._id} 
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#ecc750]/5 border-l-4 border-l-[#ecc750]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                        onClick={() => handleSelect(sub)}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#5e6f47] bg-[#5e6f47]' : 'border-gray-300 group-hover:border-[#ecc750]'
                          }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{sub.full_name || 'Unknown Name'}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Smartphone size={14} className="text-gray-400" />
                            {sub.phone_number || 'No phone'}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded w-fit">
                              {sub.participant_id || 'No ID'}
                            </span>
                            <span className="text-xs text-[#5e6f47] font-medium">
                              {sub.camp || 'No Camp'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sub._submission_time).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Action Section */}
        {selectedId && (
          <section className="bg-white rounded-2xl shadow-md border-2 border-[#ecc750]/30 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-[#ecc750]/10 px-6 py-5 border-b border-[#ecc750]/20 flex items-center gap-2">
              <BadgeCheck className="text-[#5e6f47]" size={24} />
              <h2 className="text-lg font-bold text-gray-900">Issue Document via WhatsApp</h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Phone Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Recipient WhatsApp Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={sendPhone}
                      onChange={(e) => setSendPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ecc750] focus:bg-white transition-all font-medium text-gray-900"
                      placeholder="e.g. +1234567890"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Must include country code. Defaults to the number provided in form.</p>
                </div>

                {/* Verification Checkbox */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Pre-requisites
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentReceived ? 'border-[#5e6f47] bg-[#5e6f47]/5' : 'border-gray-200 hover:border-[#ecc750]/50 hover:bg-gray-50'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={paymentReceived}
                        onChange={(e) => setPaymentReceived(e.target.checked)}
                        className="w-5 h-5 text-[#5e6f47] rounded border-gray-300 focus:ring-[#ecc750]"
                      />
                    </div>
                    <div>
                      <span className={`block font-semibold ${paymentReceived ? 'text-[#5e6f47]' : 'text-gray-700'}`}>
                        Payment Verified
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        I confirm that the required fee has been received for this participant.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Area */}
              <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
                
                <div className="flex-1 w-full md:w-auto">
                  {sendStatus === "success" && (
                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200 animate-in fade-in">
                      <CheckCircle className="text-green-500 shrink-0" size={24} />
                      <div className="flex flex-col">
                        <span className="font-bold">Sent successfully!</span>
                        <span className="text-xs opacity-90">The PDF has been routed to WhatsApp.</span>
                      </div>
                    </div>
                  )}

                  {sendStatus === "error" && (
                    <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 animate-in fade-in">
                      <AlertCircle className="text-red-500 shrink-0" size={24} />
                      <div className="flex flex-col">
                        <span className="font-bold">Transmission Failed</span>
                        <span className="text-xs opacity-90">{sendErrorMsg}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={!paymentReceived || !sendPhone || isSending || sendStatus === "success"}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-md active:scale-[0.98] ${
                    sendStatus === "success" 
                      ? 'bg-green-600 cursor-default'
                      : 'bg-[#5e6f47] hover:bg-[#4a5738] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : sendStatus === "success" ? (
                    <>
                      <CheckCircle size={20} />
                      PDF Sent
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send PDF Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
