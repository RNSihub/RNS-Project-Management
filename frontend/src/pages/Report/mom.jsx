import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType, WidthType } from 'docx';

const DailyScrumReportCreator = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    date: '',
    startTime: '',
    endTime: '',
    agenda: '',
    attendees: '',
    yesterdayUpdates: '',
    todayPlans: '',
    blockers: '',
    taskBacklog: '',
    impediments: '',
    actionsToTake: ''
  });

  const [activeTab, setActiveTab] = useState('meetingDetails');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const generateDocument = () => {
    // Create task backlog table
    const taskBacklogRows = formData.taskBacklog.split('\n').filter(item => item.trim()).map(item => {
      const parts = item.split('|');
      return new TableRow({
        children: [
          new TableCell({
            width: {
              size: 25,
              type: WidthType.PERCENTAGE,
            },
            children: [new Paragraph(parts[0] || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            }
          }),
          new TableCell({
            width: {
              size: 20,
              type: WidthType.PERCENTAGE,
            },
            children: [new Paragraph(parts[1] || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            }
          }),
          new TableCell({
            width: {
              size: 20,
              type: WidthType.PERCENTAGE,
            },
            children: [new Paragraph(parts[2] || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            }
          }),
          new TableCell({
            width: {
              size: 20,
              type: WidthType.PERCENTAGE,
            },
            children: [new Paragraph(parts[3] || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            }
          }),
          new TableCell({
            width: {
              size: 15,
              type: WidthType.PERCENTAGE,
            },
            children: [new Paragraph(parts[4] || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            }
          })
        ]
      });
    });

    const taskBacklogTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
              children: [new Paragraph({
                text: "Goal Name",
                heading: HeadingLevel.HEADING_4,
                alignment: AlignmentType.CENTER,
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
              }
            }),
            new TableCell({
              width: {
                size: 20,
                type: WidthType.PERCENTAGE,
              },
              children: [new Paragraph({
                text: "Assignee",
                heading: HeadingLevel.HEADING_4,
                alignment: AlignmentType.CENTER,
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
              }
            }),
            new TableCell({
              width: {
                size: 20,
                type: WidthType.PERCENTAGE,
              },
              children: [new Paragraph({
                text: "Status",
                heading: HeadingLevel.HEADING_4,
                alignment: AlignmentType.CENTER,
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
              }
            }),
            new TableCell({
              width: {
                size: 20,
                type: WidthType.PERCENTAGE,
              },
              children: [new Paragraph({
                text: "Blockers",
                heading: HeadingLevel.HEADING_4,
                alignment: AlignmentType.CENTER,
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
              }
            }),
            new TableCell({
              width: {
                size: 15,
                type: WidthType.PERCENTAGE,
              },
              children: [new Paragraph({
                text: "Deadline",
                heading: HeadingLevel.HEADING_4,
                alignment: AlignmentType.CENTER,
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
              }
            })
          ]
        }),
        ...taskBacklogRows
      ]
    });

    // Create attendees list with proper formatting
    const attendeesList = formData.attendees
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph(item));

    // Create yesterday updates list with proper formatting
    const yesterdayUpdates = formData.yesterdayUpdates
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "○ ", bold: true }), new TextRun(item)]
      }));

    // Create today plans list with proper formatting
    const todayPlans = formData.todayPlans
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "○ ", bold: true }), new TextRun(item)]
      }));

    // Create blockers list with proper formatting
    const blockersList = formData.blockers
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "○ ", bold: true }), new TextRun(item)]
      }));

    // Create impediments list with proper formatting
    const impedimentsList = formData.impediments
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "● ", bold: true }), new TextRun(item)]
      }));

    // Create actions to take list with proper formatting
    const actionsToTakeList = formData.actionsToTake
      .split('\n')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new Paragraph({
        children: [new TextRun({ text: "● ", bold: true }), new TextRun(item)]
      }));

    // Create the document
    const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Header with Team Name
      new Paragraph({
        text: "Daily Scrum Meeting Report (Minutes of Meeting)",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Daily Scrum Meeting Report (Minutes of Meeting)",
            size: 22 // Adjust the size as needed
          })
        ]
      }),
      new Paragraph(""),

      // Team Name
      new Paragraph({
        children: [
          new TextRun({ text: "Team Name: ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: formData.teamName, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),

      // Date
      new Paragraph({
        children: [
          new TextRun({ text: "Date: ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: formData.date, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),

      // Development Team Attendees
      new Paragraph({
        children: [
          new TextRun({ text: "Development Team Attendees: ", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      ...attendeesList.map(attendee => [
        new Paragraph({
          children: [
            new TextRun({ text: attendee, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
      new Paragraph(""),

      // Meeting Duration
      new Paragraph({
        children: [
          new TextRun({ text: "Meeting Duration: ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: `[${formData.startTime} – ${formData.endTime}]`, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),

      // 1. Agenda
      new Paragraph({
        children: [
          new TextRun({ text: "1. ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: "Agenda:", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: formData.agenda, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),

      // 2. Scrum Updates
      new Paragraph({
        children: [
          new TextRun({ text: "2. ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: "Scrum Updates", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),

      // What did you do yesterday?
      new Paragraph({
        children: [
          new TextRun({ text: "What did you do yesterday?", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      ...yesterdayUpdates.map(update => [
        new Paragraph({
          children: [
            new TextRun({ text: update, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
      new Paragraph(""),

      // What will you do today?
      new Paragraph({
        children: [
          new TextRun({ text: "What will you do today?", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      ...todayPlans.map(plan => [
        new Paragraph({
          children: [
            new TextRun({ text: plan, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
      new Paragraph(""),

      // Are there any blockers or impediments?
      new Paragraph({
        children: [
          new TextRun({ text: "Are there any blockers or impediments?", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      ...blockersList.map(blocker => [
        new Paragraph({
          children: [
            new TextRun({ text: blocker, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
      new Paragraph(""),

      // 3. Task Backlog & Progress
      new Paragraph({
        children: [
          new TextRun({ text: "3. ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: "Task Backlog & Progress", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),
      taskBacklogTable,
      new Paragraph(""),

      // 4. Impediments & Risks
      new Paragraph({
        children: [
          new TextRun({ text: "4. ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: "Impediments & Risks", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),
      ...impedimentsList.map(impediment => [
        new Paragraph({
          children: [
            new TextRun({ text: impediment, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
      new Paragraph(""),

      // 5. Actions To Take
      new Paragraph({
        children: [
          new TextRun({ text: "5. ", bold: true, size: 20 }), // Adjust the size as needed
          new TextRun({ text: "Action To Take:", bold: true, size: 20 }) // Adjust the size as needed
        ]
      }),
      new Paragraph(""),
      ...actionsToTakeList.map(action => [
        new Paragraph({
          children: [
            new TextRun({ text: action, size: 20 }) // Adjust the size as needed
          ]
        }),
        new Paragraph("")
      ]),
    ]
  }]
});


    // Generate and save document
    Packer.toBlob(doc).then((blob) => {
      const filename = `${formData.teamName}_DailyScrumReport_${formData.date.replace(/-/g, '')}.docx`;
      saveAs(blob, filename);
    });
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'meetingDetails':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-800 font-medium mb-1">Team Name*</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-800 font-medium mb-1">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-800 font-medium mb-1">Start Time*</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-800 font-medium mb-1">End Time*</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-blue-800 font-medium mb-1">Agenda*</label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Discuss Frontend, Testing, Deployment, Bug Fixing, and team availability..."
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">Development Team Attendees* (one per line)</label>
              <textarea
                name="attendees"
                value={formData.attendees}
                onChange={handleChange}
                rows="3"
                placeholder="Naveen Kumar S&#10;Aravind&#10;Sanjay N"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
          </div>
        );
      case 'scrumUpdates':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-blue-800 font-medium mb-1">What did you do yesterday?* (one per line)</label>
              <textarea
                name="yesterdayUpdates"
                value={formData.yesterdayUpdates}
                onChange={handleChange}
                rows="4"
                placeholder="Naveenkumar S - Worked on SNS Merger&#10;Aravind - Worked on SNS Merger&#10;Sanjay N – Testing the CCE and Aggregator Projects"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">What will you do today?* (one per line)</label>
              <textarea
                name="todayPlans"
                value={formData.todayPlans}
                onChange={handleChange}
                rows="4"
                placeholder="Naveenkumar S - Complete Deployment in Render or Railway.&#10;Aravind - Completion of Bug Fixing in the Aggregator Platform and Deployment&#10;Sanjay N – Testing For Aggregator and Gen AI Suite"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">Are there any blockers or impediments? (one per line)</label>
              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                rows="3"
                placeholder="N/A"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        );
      case 'taskBacklog':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-blue-800 font-medium mb-1">Task Backlog & Progress*</label>
              <div className="text-sm text-gray-500 mb-1">Format: Goal Name|Assignee|Status|Blockers|Deadline - one per line</div>
              <textarea
                name="taskBacklog"
                value={formData.taskBacklog}
                onChange={handleChange}
                rows="6"
                placeholder="Implementing scrapping pipeline|Naveenkumar|In Progress|N/A|12-3-2025&#10;Backend Integration and Frontend work|Aravindan|In Progress|N/A|12-3-2025&#10;Complete Whole Assessment Testing|Sanjay|In Progress|NO|12-3-2025"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
          </div>
        );
      case 'impedimentsActions':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-blue-800 font-medium mb-1">Impediments & Risks* (one per line)</label>
              <div className="text-sm text-gray-500 mb-1">Format: Issues Raised: [description]</div>
              <textarea
                name="impediments"
                value={formData.impediments}
                onChange={handleChange}
                rows="3"
                placeholder="Issues Raised: About Deployment of Webscrpaing&#10;Action Items for Resolution: Research on Deployment of web scraping"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">Actions To Take* (one per line)</label>
              <div className="text-sm text-gray-500 mb-1">Format: Decisions Taken: [description]</div>
              <textarea
                name="actionsToTake"
                value={formData.actionsToTake}
                onChange={handleChange}
                rows="3"
                placeholder="Decisions Taken: Completion of Project and Deployment With Bug Fixing"
                className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="space-y-6 bg-white p-8 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Daily Scrum Meeting Report (Minutes of Meeting)</h1>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div><span className="font-bold">Team Name:</span> {formData.teamName || '[Team Name]'}</div>
              <div><span className="font-bold">Date:</span> {formData.date || '[Date]'}</div>
              <div><span className="font-bold">Development Team Attendees:</span></div>
              {formData.attendees ? (
                <div className="pl-4">
                  {formData.attendees.split('\n').filter(item => item.trim()).map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              ) : '[None specified]'}
              <div><span className="font-bold">Meeting Duration:</span> [{formData.startTime || '[Start]'} – {formData.endTime || '[End]'}]</div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">1. Agenda:</h3>
              <p>{formData.agenda || '[None specified]'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Scrum Updates</h3>
              <div className="pl-4">
                <p className="font-bold">What did you do yesterday?</p>
                {formData.yesterdayUpdates ? (
                  <div className="pl-4">
                    {formData.yesterdayUpdates.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index}>○ {item}</div>
                    ))}
                  </div>
                ) : '[None specified]'}

                <p className="font-bold mt-2">What will you do today?</p>
                {formData.todayPlans ? (
                  <div className="pl-4">
                    {formData.todayPlans.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index}>○ {item}</div>
                    ))}
                  </div>
                ) : '[None specified]'}

                <p className="font-bold mt-2">Are there any blockers or impediments?</p>
                {formData.blockers ? (
                  <div className="pl-4">
                    {formData.blockers.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index}>○ {item}</div>
                    ))}
                  </div>
                ) : '○ N/A'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Task Backlog & Progress</h3>
              {formData.taskBacklog ? (
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 p-2">Goal Name</th>
                      <th className="border border-gray-300 p-2">Assignee</th>
                      <th className="border border-gray-300 p-2">Status</th>
                      <th className="border border-gray-300 p-2">Blockers</th>
                      <th className="border border-gray-300 p-2">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.taskBacklog.split('\n').filter(item => item.trim()).map((item, index) => {
                      const parts = item.split('|');
                      return (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{parts[0] || ''}</td>
                          <td className="border border-gray-300 p-2">{parts[1] || ''}</td>
                          <td className="border border-gray-300 p-2">{parts[2] || ''}</td>
                          <td className="border border-gray-300 p-2">{parts[3] || ''}</td>
                          <td className="border border-gray-300 p-2">{parts[4] || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : '[None specified]'}
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Impediments & Risks</h3>
              {formData.impediments ? (
                <div className="pl-4">
                  {formData.impediments.split('\n').filter(item => item.trim()).map((item, index) => (
                    <div key={index}>● {item}</div>
                  ))}
                </div>
              ) : '[None specified]'}
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Action To Take:</h3>
              {formData.actionsToTake ? (
                <div className="pl-4">
                  {formData.actionsToTake.split('\n').filter(item => item.trim()).map((item, index) => (
                    <div key={index}>● {item}</div>
                  ))}
                </div>
              ) : '[None specified]'}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Daily Scrum Report Creator</h1>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-blue-600 text-lg">
                {formData.teamName || 'Team Scrum'}
              </div>
            </div>
          </div>

          {/* Progress Tabs */}
          <div className="bg-blue-50 border-b border-blue-100">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'meetingDetails' ? 'text-blue-800 border-b-2 border-blue-600 bg-white' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('meetingDetails')}
              >
                1. Meeting Details
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'scrumUpdates' ? 'text-blue-800 border-b-2 border-blue-600 bg-white' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('scrumUpdates')}
              >
                2. Scrum Updates
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'taskBacklog' ? 'text-blue-800 border-b-2 border-blue-600 bg-white' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('taskBacklog')}
              >
                3. Task Backlog
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'impedimentsActions' ? 'text-blue-800 border-b-2 border-blue-600 bg-white' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('impedimentsActions')}
              >
                4. Impediments & Actions
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'preview' ? 'text-blue-800 border-b-2 border-blue-600 bg-white' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('preview')}
              >
                5. Preview
              </button>
            </div>
          </div>

          <div className="p-6">
            <form className="space-y-6">
              {renderTabContent()}

              {/* Navigation and Generate Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div>
                  {activeTab !== 'meetingDetails' &&
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['meetingDetails', 'scrumUpdates', 'taskBacklog', 'impedimentsActions', 'preview'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex - 1]);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
>
  Previous
</button>
                  }
                </div>

                <div className="flex gap-3">
                  {activeTab !== 'preview' ?
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['meetingDetails', 'scrumUpdates', 'taskBacklog', 'impedimentsActions', 'preview'];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex + 1]);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                    :
                    <button
                      type="button"
                      onClick={generateDocument}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                    >
                      <span>Generate DOCX</span>
                    </button>
                  }
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyScrumReportCreator;
