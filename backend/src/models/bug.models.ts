import { Schema, Document, model, Types } from "mongoose";

// ==============================
// INTERFACES
// ==============================
interface IAttachment {
  url: string;
  fileName?: string;
  uploadedAt?: Date;
}

interface IPhaseI_BugReport {
  toolInfo: {
    toolId: Types.ObjectId;
    toolName: string;
    toolDescription: string;
    platform?: string;
    priority: string;
    libraryName?: string;
    bugDescription: string;
    stepsToReproduce?: string;
    expectedResult: string;
    actualResult: string;
    attachments?: IAttachment[];
  };
  reportedBy: Types.ObjectId;
  assignedTester?: Types.ObjectId;
  reportedAt: Date;
}

interface IPhaseII_BugConfirmation {
  testingInfo: {
    status: string;
    isConfirmed: boolean;
    canReproduce: boolean;
    forwardedToDev: boolean;
    remarks?: string;
    attachments?: IAttachment[];
    sopFollowed?: string[];
  };
  testedBy?: Types.ObjectId;
  assignedDeveloper?: Types.ObjectId;
  testedAt?: Date;
}

interface IPhaseIII_BugAnalysis {
  analysisInfo: {
    status: string;
    rootCause?: string;
    estimatedEffort?: string;
    affectedModules?: string[];
    remarks?: string;
    attachments?: IAttachment[];
    sopProvided?: string[];
  };
  analyzedBy?: Types.ObjectId;
  analyzedAt?: Date;
}

interface IPhaseIV_Maintenance {
  maintenanceInfo: {
    status: string;
    fixDescription?: string;
    codeChanges?: string;
    remarks?: string;
    attachments?: IAttachment[];
    sopProvided?: string[];
  };
  fixedBy?: Types.ObjectId;
  fixedAt?: Date;
}

interface IPhaseV_FinalTesting {
  testingInfo: {
    status: string;
    isFixed: boolean;
    regressionTested: boolean;
    remarks?: string;
    attachments?: IAttachment[];
  };
  testedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  testedAt?: Date;
  approvedAt?: Date;
}

interface IPhaseVI_Deployment {
  deploymentInfo: {
    environment: string;
    deploymentType: string;
    remarks?: string;
    sopFollowed?: string[];
  };
  deployedBy?: Types.ObjectId;
  deployedAt?: Date;
}

interface IPhaseVII_Closure {
  closureInfo: {
    resolutionSummary?: string;
    lessonsLearned?: string;
    remarks?: string;
  };
  closedBy?: Types.ObjectId;
  closedAt?: Date;
}

// ==============================
// MAIN INTERFACE
// ==============================
export interface IBug extends Document {
  bugId: string;
  currentPhase: string;
  bugPhaseNo: number;

  phaseI_BugReport: IPhaseI_BugReport;
  phaseII_BugConfirmation?: IPhaseII_BugConfirmation;
  phaseIII_BugAnalysis?: IPhaseIII_BugAnalysis;
  phaseIV_Maintenance?: IPhaseIV_Maintenance;
  phaseV_FinalTesting?: IPhaseV_FinalTesting;
  phaseVI_Deployment?: IPhaseVI_Deployment;
  phaseVII_Closure?: IPhaseVII_Closure;

  isActive: boolean;
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}

// ==============================
// SUB-SCHEMAS
// ==============================
const attachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    fileName: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ==============================
// MAIN SCHEMA
// ==============================
const bugSchema = new Schema<IBug>(
  {
    bugId: {
      type: String,
      unique: true,
      index: true,
    },

    currentPhase: {
      type: String,
      required: true,
      index: true,
    },

    bugPhaseNo: {
      type: Number,
      default: 1,
    },

    // Phase I: Bug Report (Required)
    phaseI_BugReport: {
      type: {
        toolInfo: {
          toolId: { type: Schema.Types.ObjectId, ref: "Tool", required: true },
          toolName: { type: String, required: true },
          toolDescription: { type: String, required: true },
          platform: String,
          priority: { type: String, required: true },
          libraryName: String,
          bugDescription: { type: String, required: true },
          stepsToReproduce: String,
          expectedResult: { type: String, required: true },
          actualResult: { type: String, required: true },
          attachments: [attachmentSchema],
        },
        reportedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedTester: { type: Schema.Types.ObjectId, ref: "User" },
        reportedAt: { type: Date, default: Date.now, required: true },
      },
      required: true,
    },

    // Phase II: Bug Confirmation
    phaseII_BugConfirmation: {
      testingInfo: {
        status: String,
        isConfirmed: Boolean,
        canReproduce: Boolean,
        forwardedToDev: Boolean,
        remarks: String,
        attachments: [attachmentSchema],
        sopFollowed: [String],
      },
      testedBy: { type: Schema.Types.ObjectId, ref: "User" },
      assignedDeveloper: { type: Schema.Types.ObjectId, ref: "User" },
      testedAt: Date,
    },

    // Phase III: Bug Analysis
    phaseIII_BugAnalysis: {
      analysisInfo: {
        status: String,
        rootCause: String,
        estimatedEffort: String,
        affectedModules: [String],
        remarks: String,
        attachments: [attachmentSchema],
        sopProvided: [String],
      },
      analyzedBy: { type: Schema.Types.ObjectId, ref: "User" },
      analyzedAt: Date,
    },

    // Phase IV: Maintenance
    phaseIV_Maintenance: {
      maintenanceInfo: {
        status: String,
        fixDescription: String,
        codeChanges: String,
        remarks: String,
        attachments: [attachmentSchema],
        sopProvided: [String],
      },
      fixedBy: { type: Schema.Types.ObjectId, ref: "User" },
      fixedAt: Date,
    },

    // Phase V: Final Testing
    phaseV_FinalTesting: {
      testingInfo: {
        status: String,
        isFixed: Boolean,
        regressionTested: Boolean,
        remarks: String,
        attachments: [attachmentSchema],
      },
      testedBy: { type: Schema.Types.ObjectId, ref: "User" },
      approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      testedAt: Date,
      approvedAt: Date,
    },

    // Phase VI: Deployment
    phaseVI_Deployment: {
      deploymentInfo: {
        environment: String,
        deploymentType: String,
        remarks: String,
        sopFollowed: [String],
      },
      deployedBy: { type: Schema.Types.ObjectId, ref: "User" },
      deployedAt: Date,
    },

    // Phase VII: Closure
    phaseVII_Closure: {
      closureInfo: {
        resolutionSummary: String,
        lessonsLearned: String,
        remarks: String,
      },
      closedBy: { type: Schema.Types.ObjectId, ref: "User" },
      closedAt: Date,
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
    collection: "bugs",
  }
);

// ==============================
// INDEXES
// ==============================
bugSchema.index({ "phaseI_BugReport.toolInfo.toolId": 1 });
bugSchema.index({ "phaseI_BugReport.reportedBy": 1 });
bugSchema.index({ "phaseI_BugReport.toolInfo.priority": 1 });
bugSchema.index({ currentPhase: 1, isActive: 1 });
bugSchema.index({ createdAt: -1 });

// ==============================
// METHODS
// ==============================
bugSchema.methods.moveToPhase = function (phase: string, phaseNo?: number) {
  this.currentPhase = phase;
  if (phaseNo !== undefined) {
    this.bugPhaseNo = phaseNo;
  }
  return this.save();
};

// ==============================
// STATIC METHODS
// ==============================
bugSchema.statics.generateBugId = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    bugId: new RegExp(`^BUG-${year}-`),
  });
  return `BUG-${year}-${String(count + 1).padStart(4, "0")}`;
};

// ==============================
// PRE-SAVE HOOK
// ==============================
bugSchema.pre("save", async function (next) {
  if (this.isNew && !this.bugId) {
    this.bugId = await (this.constructor as any).generateBugId();
  }
  next();
});

// ==============================
// MODEL EXPORT
// ==============================
const BugModel = model<IBug>("bug", bugSchema);
export default BugModel;
