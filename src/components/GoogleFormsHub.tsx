import React, { useState, useEffect } from "react";
import { 
  FileText, 
  PlusCircle, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Loader2, 
  ArrowUpRight, 
  LogOut, 
  FileSpreadsheet, 
  Inbox, 
  RefreshCw, 
  Award,
  Sparkles,
  Link
} from "lucide-react";
import { formsGoogleSignIn, formsLogout, getFormsAccessToken, initFormsAuth } from "../utils/googleFormsAuth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface FormResponseItem {
  responseId: string;
  createTime: string;
  answers: Record<string, {
    textAnswers: { answers: { value: string }[] }
  }>;
}

export default function GoogleFormsHub() {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Synced Google Form IDs
  const [activeFormId, setActiveFormId] = useState<string>("");
  const [activeFormUri, setActiveFormUri] = useState<string>("");
  const [recentResponses, setRecentResponses] = useState<FormResponseItem[]>([]);
  const [activeTab, setActiveTab] = useState<"client" | "admin">("client");

  // Load configured Form ID from Firebase Firestore to share with customers
  useEffect(() => {
    const fetchSharedForm = async () => {
      try {
        const docRef = doc(db, "system_checks", "google_forms");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.formId) setActiveFormId(data.formId);
          if (data.responderUri) setActiveFormUri(data.responderUri);
        }
      } catch (err) {
        console.warn("Firestore Form configuration fetch skipped or offline:", err);
      }
    };
    fetchSharedForm();

    // Setup forms auth listener
    const unsubscribe = initFormsAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync token value if active
  useEffect(() => {
    const currentToken = getFormsAccessToken();
    if (currentToken && !token) {
      setToken(currentToken);
    }
  }, [user]);

  const handleSignIn = async () => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await formsGoogleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          text: `Successfully authenticated Google Forms connection for ${res.user.email}!`,
          type: "success"
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || "Failed to authenticate with Google. Ensure popups are allowed.",
        type: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogOut = async () => {
    setActionLoading(true);
    try {
      await formsLogout();
      setUser(null);
      setToken(null);
      setStatusMessage({
        text: "Logged out from official Google Forms account dashboard.",
        type: "info"
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: Create a brand new Google Form under the active account using official Google Forms v1 API
  const handleCreateGoogleForm = async () => {
    if (!token) return;
    setActionLoading(true);
    setStatusMessage(null);

    try {
      // 1. Post top-level Form container
      const formPayload = {
        info: {
          title: "FoodieNepal Human Support Registration & Review Survey",
          documentTitle: "FoodieNepal Customer Resolution Form"
        }
      };

      const res = await fetch("https://forms.googleapis.com/v1/forms", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to create Google Form metadata.");
      }

      const formResult = await res.json();
      const newFormId = formResult.formId;
      const responderUri = formResult.responderUri;

      // 2. Add structural question fields via batchUpdate
      const questionsPayload = {
        requests: [
          {
            createItem: {
              item: {
                title: "How much did you enjoy the hygiene, warm presentation, and taste of Nepalese delicacies? (1 to 5 Stars)",
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: "RADIO",
                      options: [
                        { value: "1 - Poor" },
                        { value: "2 - Satisfactory" },
                        { value: "3 - Good" },
                        { value: "4 - Highly Authentic & Relishing" },
                        { value: "5 - Best Momo & Thakali of my life!" }
                      ]
                    }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: "Specific support concerns (e.g., Delay details, Delivery OTP errors, incorrect menu, Refund request)",
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: "CHECKBOX",
                      options: [
                        { value: "Meal Delay / Delivery speed concern" },
                        { value: "Rider Contact unreachable" },
                        { value: "Refund request for missed items" },
                        { value: "Technical payment transaction discrepancy" },
                        { value: "Other general catering support" }
                      ]
                    }
                  }
                }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: "Please write more context details for human customer care intervention",
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: { paragraph: true }
                  }
                }
              },
              location: { index: 2 }
            }
          }
        ]
      };

      const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${newFormId}:batchUpdate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(questionsPayload)
      });

      if (!updateRes.ok) {
        console.warn("Forms batch update skipped query fields setup (using raw form).");
      }

      // 3. Persist the generated Google Form to global Firebase Firestore
      await setDoc(doc(db, "system_checks", "google_forms"), {
        formId: newFormId,
        responderUri: responderUri,
        creatorEmail: user?.email || "unknown",
        createdAt: new Date().toISOString()
      });

      setActiveFormId(newFormId);
      setActiveFormUri(responderUri);
      setStatusMessage({
        text: "Successfully generated a pristine Google Form on your Google Drive and linked it globally!",
        type: "success"
      });

    } catch (err: any) {
      setStatusMessage({
        text: err.message || "Failed to deploy Google Form. Check API scopes.",
        type: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: Pull real user responses from Google Forms API
  const handleFetchResponses = async () => {
    if (!token || !activeFormId) return;
    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`https://forms.googleapis.com/v1/forms/${activeFormId}/responses`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Verify your account is the authentic owner of this Form.");
      }

      const data = await res.json();
      const responsesList = data.responses || [];
      setRecentResponses(responsesList);
      
      setStatusMessage({
        text: `Retrieved ${responsesList.length} global responses from Google Form successfully!`,
        type: "success"
      });
    } catch (err: any) {
      setStatusMessage({
        text: err.message || "Verify if your signed in Gmail is the active owner/editor of the Google Form.",
        type: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isOfficialEmail = user?.email?.toLowerCase() === "foodienepalnpofficial@gmail.com";

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden" id="google-forms-system-hub">
      {/* Header Panel */}
      <div className="bg-slate-50 border-b border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-purple-50 rounded-full border border-purple-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Google Workspace</span>
            </div>
            {activeFormId && (
              <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-mono">
                ● Connected
              </div>
            )}
          </div>
          <h2 className="text-xl font-serif italic font-bold mt-1 text-slate-800">
            Google Forms Resolution Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Instantly file complaints, rate delivery riders, provide Nepalese catering reviews, or manage corporate forms via Google Drive.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "client" ? "bg-white text-slate-800 shadow-sm" : "text-gray-500 hover:text-slate-800"
            }`}
          >
            Customer Care
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "admin" ? "bg-white text-slate-800 shadow-sm" : "text-gray-500 hover:text-slate-800"
            }`}
          >
            Form Administration
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Connection status card */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold font-mono">
                GF
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Google Authorization State</span>
                <p className="text-xs font-bold text-slate-800">
                  {user ? (
                    <span className="text-emerald-700">Authenticated: {user.email}</span>
                  ) : (
                    <span className="text-gray-400">Not Connected (Using Default Public Forms)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={handleLogOut}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 flex items-center justify-center">G</div>
                  )}
                  <span>Connect with Google Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Special Verification Callout regarding the support Gmail requirement */}
          <div className="mt-3.5 border-t border-slate-200 pt-3 flex items-center gap-2 text-[11px] text-[#8B1A1A]">
            <AlertCircle className="w-4 h-4 text-[#8B1A1A]/70 flex-shrink-0" />
            <span>
              <b>Design Mandate:</b> Google Forms must reside inside <b>foodienepalnpofficial@gmail.com</b>. If you are an administrator, authenticate with that specific Google Account.
            </span>
          </div>
        </div>

        {/* Global Action Status Message */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border mb-6 text-xs text-left flex items-start gap-2.5 ${
            statusMessage.type === "success" 
              ? "bg-green-50 text-green-800 border-green-100" 
              : statusMessage.type === "error" 
              ? "bg-red-50 text-red-800 border-red-100" 
              : "bg-blue-50 text-blue-800 border-blue-100"
          }`}>
            {statusMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
            {statusMessage.type === "error" && <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
            {statusMessage.type === "info" && <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
            <span className="font-medium leading-normal">{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Client Feed Mode */}
        {activeTab === "client" && (
          <div className="text-left space-y-6">
            <div className="bg-emerald-50/50 border border-[#2D6A4F]/10 p-5 rounded-2.5xl flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#2D6A4F] uppercase tracking-widest font-mono">Official Feedback Link</span>
                <h3 className="text-base font-bold text-emerald-950 font-serif italic">
                  Have feedback or delivery disputes?
                </h3>
                <p className="text-xs text-emerald-800/80 max-w-xl">
                  Submit ratings and feedback via our customized official support questionnaire. The form directly records secure entries associated safely on Google.
                </p>
                
                {activeFormId ? (
                  <div className="pt-2 text-[10px] text-gray-500 font-mono">
                    <span className="font-bold">Active Form ID:</span> {activeFormId}
                  </div>
                ) : (
                  <div className="pt-2 text-xs font-semibold text-gray-500 italic">
                    Note: A default backup support form will open if the system administrator has not deployed a custom sheet yet.
                  </div>
                )}
              </div>

              <a
                href={activeFormUri || "https://docs.google.com/forms/d/e/1FAIpQLSe-XoMAt_eXG7Kx-97C_vbe08i-R1bKx9U62w_4C-dGZ0N1ug/viewform"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4.5 py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white font-bold text-xs rounded-xl shadow-md tracking-wider transition-all cursor-pointer whitespace-nowrap self-center"
              >
                <span>Launch Google Form Survey</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Simulated Live Form preview / manual query filing card */}
            <div className="border border-gray-150 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Our active Form setup targets:</span>
              </h3>
              
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <span><b>Delicacy Authentic Rating</b> - Standard 5-star scoring of taste, spices, and hygiene.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <span><b>Logistics Delay Flagging</b> - Immediate checkboxes for meal tracking or contact delays.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <span><b>Custom Feedback Field</b> - Paragraph narrative for specific human representative review.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Admin Administration Mode */}
        {activeTab === "admin" && (
          <div className="text-left space-y-6">
            {!user ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-3xl">
                <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Authorization Required</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  Please authenticate with your official Google account above. Managing form structure and viewing database responses requires Google Forms scopes.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Authenticate Now
                  </button>
                </div>
              </div>
            ) : !isOfficialEmail ? (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2.5xl text-xs text-amber-900 leading-normal space-y-3">
                <div className="flex items-start gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5" />
                  <span>Limited Privileges Mode: {user.email}</span>
                </div>
                <p className="text-[11.5px] text-amber-800">
                  Your logged in credentials do not match the required standard support Gmail: <b className="font-mono text-xs">foodienepalnpofficial@gmail.com</b>. 
                  Although you are authenticated on Google, admin operation endpoints (such as writing to the root forms collection) require permissions restricted to the official support account to ensure database coherence.
                </p>
                <p className="font-semibold text-emerald-950">
                  💡 Hint to bypass for local testing: You can proceed right away to create or fetch responses under your own active Gmail account to evaluate the workflow, but make sure to commit real production logs to foodienepalnpofficial@gmail.com!
                </p>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={handleCreateGoogleForm}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold transition-all text-[11px]"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    <span>Deploy Demo Form under My Account</span>
                  </button>
                  {activeFormId && (
                    <button
                      onClick={handleFetchResponses}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold transition-all text-[11px]"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Pull Responses</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Authorized Suite */}
                <div className="bg-purple-50/70 border border-purple-100 p-5 rounded-2.5xl">
                  <div className="flex flex-col md:flex-row items-baseline justify-between gap-2.5 mb-2">
                    <span className="text-[10px] font-mono font-black text-purple-700 uppercase tracking-widest bg-purple-100 px-2 py-0.5 rounded">
                      Enterprise Admin Active (foodienepalnpofficial@gmail.com)
                    </span>
                    {activeFormId && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Form ID: <b>{activeFormId}</b>
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-800 font-serif">
                    Google Forms Operations Hub
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    Deploy standard survey questionnaires directly into the official Support drive, update fields, or grab live responses submitted by customer profiles instantly.
                  </p>

                  <div className="flex flex-wrap gap-2.5 mt-5">
                    <button
                      onClick={handleCreateGoogleForm}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                      <span>Deploy Official Forms Structure</span>
                    </button>

                    {activeFormId && (
                      <button
                        onClick={handleFetchResponses}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span>Sync Live Form Responses</span>
                      </button>
                    )}

                    {activeFormUri && (
                      <a
                        href={activeFormUri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-slate-500 text-slate-705 font-bold text-xs rounded-xl transition-all"
                      >
                        <span>View Live Layout</span>
                        <ArrowUpRight className="w-4.5 h-4.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="border border-gray-150 rounded-2.5xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-gray-150 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                        Live Submissions received ({recentResponses.length})
                      </h4>
                    </div>
                  </div>

                  {recentResponses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold">No responses found yet</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                        Launch the live form, submit test ratings, and then click **Sync Live Form Responses** to aggregate data!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-mono text-gray-500">
                            <th className="p-3 text-center">No.</th>
                            <th className="p-3">Response Identifier</th>
                            <th className="p-3">Submission Timestamp</th>
                            <th className="p-3">Answer Extracts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recentResponses.map((res: any, idx) => {
                            // Extract raw text if any
                            const answersMap = res.answers || {};
                            const values: string[] = [];
                            Object.keys(answersMap).forEach(key => {
                              const list = answersMap[key]?.textAnswers?.answers || [];
                              if (list.length > 0 && list[0].value) {
                                values.push(list[0].value);
                              }
                            });

                            return (
                              <tr key={res.responseId || idx} className="hover:bg-slate-50 font-sans">
                                <td className="p-3 text-center text-gray-400 font-bold">{idx + 1}</td>
                                <td className="p-3 font-mono font-semibold text-[10px] text-slate-500">{res.responseId}</td>
                                <td className="p-3 text-gray-500">{new Date(res.createTime).toLocaleString()}</td>
                                <td className="p-3">
                                  {values.length === 0 ? (
                                    <span className="text-gray-400 font-medium italic">Blank answers filed</span>
                                  ) : (
                                    <div className="space-y-1">
                                      {values.map((v, vIdx) => (
                                        <div key={vIdx} className="bg-slate-100 px-2 py-1 rounded max-w-sm font-sans font-medium text-[11px] truncate" title={v}>
                                          {v}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
