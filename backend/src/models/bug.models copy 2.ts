import { Schema, Document, model } from "mongoose";

// ==============================
// INTERFACE
// ==============================
interface BugInterface extends Document {
  phaseI_BugReport?: {
    toolInfo: {
      name?: string;
      toolDescription: string;
      platform?: string;
      priority?: string;
      libraryName?: string;
      description?: string;
      attachmentUrls?: string[];
      assignedTester?: string;
      expectedResult?: string;
      actualResult?: string;
    };
    dateTime?: Date;
    bugReporter?: BasicUserInfo;
    testerInfo?: BasicUserInfo;
  };

  phaseII_BugConfirmation?: {
    testingInfo?: {
      status?: string;
      forwardedToDev?: string;
      delayReason?: string;
      attachmentUrls?: string[];
      remarks?: string;
      followedSop?: string[];
    };
    dateTime?: Date;
    devInfo?: BasicUserInfo;
  };

  phaseIII_BugAnalysis?: {
    bugAnalysis?: {
      analysisStatus?: string;
      status?: string;
      attachmentUrls?: string[];
      devRemarks?: string;
      providedSop?: string[];
      delayReason?: string;
    };
    dateTime?: Date;
  };

  phaseIV_Maintenance?: {
    maintenanceInfo?: {
      maintenanceStatus?: string;
      status?: string;
      attachmentUrls?: string[];
      devRemarks?: string;
      providedSop?: string[];
      delayReason?: string;
    };
    dateTime?: Date;
  };

  phaseV_FinalTesting?: {
    dateTime?: Date;
    alphaTesting?: string;
    alphaInfo?: BasicUserInfo;
    testingFlag?: {
      flagStatus?: string;
      finalTestRemarks?: string;
    };
    alphaFlag?: {
      dateTime?: Date;
      alphaFlagStatus?: string;
      alphaRemarks?: string;
    };
  };

  phaseVI_Deployment?: {
    dateTime?: Date;
    deployedBy?: BasicUserInfo;
    deploymentRemarks?: string;
    sopFollowed?: string[];
  };

  phaseVII_ExternalDeployment?: {
    dateTime?: Date;
    deployedByOther?: BasicUserInfo;
    remarks?: string;
    sopFollowedByOther?: string[];
  };

  phaseStatus:
    | "New Bug"
    | "Initial Testing"
    | "Bug Analysis"
    | "Under Maintenance"
    | "Final Testing"
    | "Closed";
}

interface BasicUserInfo {
  id?: string;
  username?: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string;
}

// ==============================
// SCHEMA DEFINITIONS
// ==============================

// Common sub-schema for user info
const userInfoSchema = new Schema<BasicUserInfo>(
  {
    id: String,
    username: String,
    name: String,
    mobile: String,
    email: String,
    department: String,
  },
  { _id: false }
);

// ==============================
// MAIN SCHEMA
// ==============================
const bugSchema = new Schema<BugInterface>(
  {
    toolName: { type: String, required: true, trim: true },
    toolDescription: { type: String, default: "" },
    testerId: { type: String },
    devId: { type: String },
    stack: { type: [String], default: [] },
    libraryName: { type: String },
    htmlVersion: { type: String },
    lastLibraryUpdate: { type: Date },
    lastHtmlUpdate: { type: Date },
    lastResolvedDev: { type: Date },
    lastResolvedTester: { type: Date },
    lastBugReport: { type: Date },
    SOP: { type: String },
    ReleaseNotes: { type: String },

    phaseI_BugReport: {
      toolInfo: {
        bugReportDateTime: Date,
        name: String,
        platform: String,
        priority: String,
        description: String,
        attachmentUrls: [String],
        assignedTester: String,
        expectedResult: String,
        actualResult: String,
      },
      bugReporter: userInfoSchema,
      testerInfo: userInfoSchema,
    },

    phaseII_BugConfirmation: {
      testingInfo: {
        bugConfirmDateTime: Date,
        status: String,
        forwardedToDev: String,
        delayReason: String,
        attachmentUrls: [String],
        remarks: String,
        followedSop: [String],
      },
      devInfo: userInfoSchema,
    },

    phaseIII_BugAnalysis: {
      bugAnalysis: {
        bugAnalysisDateTime: Date,
        analysisStatus: String,
        status: String,
        attachmentUrls: [String],
        devRemarks: String,
        providedSop: [String],
        delayReason: String,
      },
    },

    phaseIV_Maintenance: {
      maintenanceInfo: {
        maintenanceDateTime: Date,
        maintenanceStatus: String,
        status: String,
        attachmentUrls: [String],
        devRemarks: String,
        providedSop: [String],
        delayReason: String,
      },
    },

    phaseV_FinalTesting: {
      finalTestDateTime: Date,
      alphaTesting: String,
      alphaInfo: userInfoSchema,
      testingFlag: {
        flagStatus: String,
        finalTestRemarks: String,
      },
      alphaFlag: {
        alphaTestDateTime: Date,
        alphaFlagStatus: String,
        alphaRemarks: String,
      },
    },

    phaseVI_Deployment: {
      deploymentDateTime: Date,
      deployedBy: userInfoSchema,
      deploymentRemarks: String,
      sopFollowed: [String],
    },

    phaseVII_ExternalDeployment: {
      deployedByOtherDateTime: Date,
      deployedByOther: userInfoSchema,
      remarks: String,
      sopFollowedByOther: [String],
    },

    phaseStatus: {
      type: String,
      enum: [
        "UnderDevelopment",
        "InitialTesting",
        "VerifiedTesting",
        "Deployed",
        "Closed",
        "Reopened",
      ],
      default: "UnderDevelopment",
    },
  },
  { timestamps: true }
);

// ==============================
// MODEL EXPORT
// ==============================
const BugModel = model<BugInterface>("Bug", bugSchema);
export default BugModel;
export type { BugInterface };
