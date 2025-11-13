import { Schema, Document, model } from "mongoose";

// ==============================
// INTERFACES
// ==============================
interface BasicUserInfo {
  id?: string;
  username?: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string;
}

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

// ==============================
// SUB-SCHEMAS
// ==============================
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
    phaseI_BugReport: {
      toolInfo: {
        name: String,
        toolDescription: { type: String, required: true },
        platform: String,
        priority: String,
        libraryName: String,
        description: String,
        attachmentUrls: [String],
        assignedTester: String,
        expectedResult: String,
        actualResult: String,
      },
      dateTime: Date,
      bugReporter: userInfoSchema,
      testerInfo: userInfoSchema,
    },

    phaseII_BugConfirmation: {
      testingInfo: {
        status: String,
        forwardedToDev: String,
        delayReason: String,
        attachmentUrls: [String],
        remarks: String,
        followedSop: [String],
      },
      dateTime: Date,
      devInfo: userInfoSchema,
    },

    phaseIII_BugAnalysis: {
      bugAnalysis: {
        analysisStatus: String,
        status: String,
        attachmentUrls: [String],
        devRemarks: String,
        providedSop: [String],
        delayReason: String,
      },
      dateTime: Date,
    },

    phaseIV_Maintenance: {
      maintenanceInfo: {
        maintenanceStatus: String,
        status: String,
        attachmentUrls: [String],
        devRemarks: String,
        providedSop: [String],
        delayReason: String,
      },
      dateTime: Date,
    },

    phaseV_FinalTesting: {
      dateTime: Date,
      alphaTesting: String,
      alphaInfo: userInfoSchema,
      testingFlag: {
        flagStatus: String,
        finalTestRemarks: String,
      },
      alphaFlag: {
        dateTime: Date,
        alphaFlagStatus: String,
        alphaRemarks: String,
      },
    },

    phaseVI_Deployment: {
      dateTime: Date,
      deployedBy: userInfoSchema,
      deploymentRemarks: String,
      sopFollowed: [String],
    },

    phaseVII_ExternalDeployment: {
      dateTime: Date,
      deployedByOther: userInfoSchema,
      remarks: String,
      sopFollowedByOther: [String],
    },

    phaseStatus: {
      type: String,
      enum: [
        "New Bug",
        "Initial Testing",
        "Bug Analysis",
        "Under Maintenance",
        "Final Testing",
        "Closed",
      ],
      default: "New Bug",
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
